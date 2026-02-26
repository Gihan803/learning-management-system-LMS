<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\MaterialCompletion;
use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    // List all approved courses
    public function courses(Request $request)
    {
        $courses = Course::where('status', 'approved')
            ->with('instructor:id,name')
            ->withCount('materials', 'quizzes', 'enrollments')
            ->get();

        return response()->json($courses);
    }

    // Get course detail
    public function courseDetail(Request $request, $id)
    {
        $course = Course::where('status', 'approved')
            ->with(['instructor:id,name', 'materials', 'quizzes.questions'])
            ->withCount('enrollments')
            ->findOrFail($id);

        // Check enrollment and progress
        $enrollment = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $id)
            ->first();

        $completedMaterials = [];
        if ($enrollment) {
            $completedMaterials = MaterialCompletion::where('enrollment_id', $enrollment->id)
                ->pluck('material_id')
                ->toArray();
        }

        return response()->json([
            'course' => $course,
            'is_enrolled' => !!$enrollment,
            'completed_materials' => $completedMaterials,
            'enrollment' => $enrollment,
        ]);
    }

    // Enroll in a course
    public function enroll(Request $request, $id)
    {
        $course = Course::where('status', 'approved')->findOrFail($id);

        $existing = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already enrolled'], 409);
        }

        $enrollment = Enrollment::create([
            'user_id' => $request->user()->id,
            'course_id' => $id,
        ]);

        return response()->json(['message' => 'Enrolled successfully', 'enrollment' => $enrollment], 201);
    }

    // Get my enrollments
    public function myEnrollments(Request $request)
    {
        $enrollments = Enrollment::where('user_id', $request->user()->id)
            ->with(['course.instructor:id,name', 'course.materials', 'course.quizzes'])
            ->get()
            ->map(function ($enrollment) {
            $totalMaterials = $enrollment->course->materials->count();
            $completedMaterials = MaterialCompletion::where('enrollment_id', $enrollment->id)->count();
            $totalQuizzes = $enrollment->course->quizzes->count();
            $completedQuizzes = QuizAttempt::where('user_id', $enrollment->user_id)
                ->whereIn('quiz_id', $enrollment->course->quizzes->pluck('id'))
                ->count();

            $totalItems = $totalMaterials + $totalQuizzes;
            $completedItems = $completedMaterials + $completedQuizzes;
            $progress = $totalItems > 0 ? round(($completedItems / $totalItems) * 100) : 0;

            return [
            'id' => $enrollment->id,
            'course' => $enrollment->course,
            'progress' => $progress,
            'completed_materials' => $completedMaterials,
            'total_materials' => $totalMaterials,
            'completed_quizzes' => $completedQuizzes,
            'total_quizzes' => $totalQuizzes,
            'completed_at' => $enrollment->completed_at,
            'created_at' => $enrollment->created_at,
            ];
        });

        return response()->json($enrollments);
    }

    // Mark material as complete
    public function completeMaterial(Request $request, $materialId)
    {
        $enrollment = Enrollment::where('user_id', $request->user()->id)
            ->whereHas('course.materials', function ($q) use ($materialId) {
            $q->where('materials.id', $materialId);
        })
            ->firstOrFail();

        $existing = MaterialCompletion::where('enrollment_id', $enrollment->id)
            ->where('material_id', $materialId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already completed'], 409);
        }

        MaterialCompletion::create([
            'enrollment_id' => $enrollment->id,
            'material_id' => $materialId,
        ]);

        // Check if all materials & quizzes are done
        $this->checkCourseCompletion($enrollment);

        return response()->json(['message' => 'Material marked as complete']);
    }

    // Submit quiz attempt (auto-graded)
    public function submitQuiz(Request $request, $quizId)
    {
        $quiz = Quiz::with('questions')->findOrFail($quizId);

        // Check if enrolled
        $enrollment = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $quiz->course_id)
            ->firstOrFail();

        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:questions,id',
            'answers.*.selected_option' => 'required|in:a,b,c,d',
        ]);

        // Auto-grade
        $totalQuestions = $quiz->questions->count();
        $correctAnswers = 0;

        $attempt = QuizAttempt::create([
            'quiz_id' => $quizId,
            'user_id' => $request->user()->id,
            'score' => 0,
            'total_questions' => $totalQuestions,
            'correct_answers' => 0,
        ]);

        foreach ($validated['answers'] as $answer) {
            $question = $quiz->questions->find($answer['question_id']);
            $isCorrect = $question && $question->correct_option === $answer['selected_option'];

            if ($isCorrect) {
                $correctAnswers++;
            }

            QuizAnswer::create([
                'attempt_id' => $attempt->id,
                'question_id' => $answer['question_id'],
                'selected_option' => $answer['selected_option'],
                'is_correct' => $isCorrect,
            ]);
        }

        $score = $totalQuestions > 0 ? round(($correctAnswers / $totalQuestions) * 100, 2) : 0;
        $attempt->update([
            'score' => $score,
            'correct_answers' => $correctAnswers,
        ]);

        // Check course completion
        $this->checkCourseCompletion($enrollment);

        return response()->json([
            'message' => 'Quiz submitted and graded',
            'attempt' => $attempt->fresh(),
            'score' => $score,
            'correct_answers' => $correctAnswers,
            'total_questions' => $totalQuestions,
        ]);
    }

    // Get progress overview
    public function progress(Request $request)
    {
        $enrollments = Enrollment::where('user_id', $request->user()->id)
            ->with(['course.materials', 'course.quizzes'])
            ->get();

        $progressData = $enrollments->map(function ($enrollment) use ($request) {
            $totalMaterials = $enrollment->course->materials->count();
            $completedMaterials = MaterialCompletion::where('enrollment_id', $enrollment->id)->count();

            $quizIds = $enrollment->course->quizzes->pluck('id');
            $quizAttempts = QuizAttempt::where('user_id', $request->user()->id)
                ->whereIn('quiz_id', $quizIds)
                ->get();

            $totalQuizzes = $quizIds->count();
            $completedQuizzes = $quizAttempts->groupBy('quiz_id')->count();
            $avgScore = $quizAttempts->avg('score') ?? 0;

            $totalItems = $totalMaterials + $totalQuizzes;
            $completedItems = $completedMaterials + $completedQuizzes;
            $progress = $totalItems > 0 ? round(($completedItems / $totalItems) * 100) : 0;

            return [
            'course_id' => $enrollment->course->id,
            'course_title' => $enrollment->course->title,
            'progress' => $progress,
            'completed_materials' => $completedMaterials,
            'total_materials' => $totalMaterials,
            'completed_quizzes' => $completedQuizzes,
            'total_quizzes' => $totalQuizzes,
            'average_score' => round($avgScore, 2),
            'is_completed' => $progress >= 100,
            ];
        });

        return response()->json($progressData);
    }

    private function checkCourseCompletion(Enrollment $enrollment)
    {
        $course = $enrollment->course->load('materials', 'quizzes');
        $totalMaterials = $course->materials->count();
        $completedMaterials = MaterialCompletion::where('enrollment_id', $enrollment->id)->count();

        $totalQuizzes = $course->quizzes->count();
        $completedQuizzes = QuizAttempt::where('user_id', $enrollment->user_id)
            ->whereIn('quiz_id', $course->quizzes->pluck('id'))
            ->distinct('quiz_id')
            ->count();

        if ($completedMaterials >= $totalMaterials && $completedQuizzes >= $totalQuizzes && $totalMaterials + $totalQuizzes > 0) {
            $enrollment->update(['completed_at' => now()]);
        }
    }
}
