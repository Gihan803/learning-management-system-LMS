<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Material;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;

class InstructorController extends Controller
{
    // List instructor's courses
    public function courses(Request $request)
    {
        $courses = Course::where('instructor_id', $request->user()->id)
            ->withCount('materials', 'quizzes', 'enrollments')
            ->get();

        return response()->json($courses);
    }

    // Create course
    public function createCourse(Request $request)
    {
        if (!$request->user()->is_approved) {
            return response()->json(['message' => 'Your account is not yet approved by admin.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $course = Course::create([
            'instructor_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Course created. Pending admin approval.', 'course' => $course], 201);
    }

    // Update course
    public function updateCourse(Request $request, $id)
    {
        $course = Course::where('instructor_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
        ]);

        $course->update($validated);

        return response()->json(['message' => 'Course updated', 'course' => $course]);
    }

    // Delete course
    public function deleteCourse(Request $request, $id)
    {
        $course = Course::where('instructor_id', $request->user()->id)->findOrFail($id);
        $course->delete();

        return response()->json(['message' => 'Course deleted']);
    }

    // Add material to course
    public function addMaterial(Request $request, $courseId)
    {
        $course = Course::where('instructor_id', $request->user()->id)->findOrFail($courseId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:video,pdf',
            'content_url' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf|max:10240',
            'sort_order' => 'nullable|integer',
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('materials', 'public');
        }

        $material = Material::create([
            'course_id' => $courseId,
            'title' => $validated['title'],
            'type' => $validated['type'],
            'content_url' => $validated['content_url'] ?? null,
            'file_path' => $filePath,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return response()->json(['message' => 'Material added', 'material' => $material], 201);
    }

    // Delete material
    public function deleteMaterial(Request $request, $materialId)
    {
        $material = Material::whereHas('course', function ($q) use ($request) {
            $q->where('instructor_id', $request->user()->id);
        })->findOrFail($materialId);

        $material->delete();

        return response()->json(['message' => 'Material deleted']);
    }

    // Create quiz
    public function createQuiz(Request $request, $courseId)
    {
        $course = Course::where('instructor_id', $request->user()->id)->findOrFail($courseId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $quiz = Quiz::create([
            'course_id' => $courseId,
            'title' => $validated['title'],
        ]);

        return response()->json(['message' => 'Quiz created', 'quiz' => $quiz], 201);
    }

    // Add questions to quiz
    public function addQuestions(Request $request, $quizId)
    {
        $quiz = Quiz::whereHas('course', function ($q) use ($request) {
            $q->where('instructor_id', $request->user()->id);
        })->findOrFail($quizId);

        $validated = $request->validate([
            'questions' => 'required|array|min:1',
            'questions.*.question_text' => 'required|string',
            'questions.*.option_a' => 'required|string',
            'questions.*.option_b' => 'required|string',
            'questions.*.option_c' => 'required|string',
            'questions.*.option_d' => 'required|string',
            'questions.*.correct_option' => 'required|in:a,b,c,d',
        ]);

        $questions = [];
        foreach ($validated['questions'] as $q) {
            $questions[] = Question::create([
                'quiz_id' => $quizId,
                'question_text' => $q['question_text'],
                'option_a' => $q['option_a'],
                'option_b' => $q['option_b'],
                'option_c' => $q['option_c'],
                'option_d' => $q['option_d'],
                'correct_option' => $q['correct_option'],
            ]);
        }

        return response()->json(['message' => 'Questions added', 'questions' => $questions], 201);
    }

    // Delete quiz
    public function deleteQuiz(Request $request, $quizId)
    {
        $quiz = Quiz::whereHas('course', function ($q) use ($request) {
            $q->where('instructor_id', $request->user()->id);
        })->findOrFail($quizId);

        $quiz->delete();

        return response()->json(['message' => 'Quiz deleted']);
    }

    // View enrolled students
    public function enrolledStudents(Request $request)
    {
        $courseIds = Course::where('instructor_id', $request->user()->id)->pluck('id');

        $students = \App\Models\Enrollment::whereIn('course_id', $courseIds)
            ->with(['user:id,name,email', 'course:id,title'])
            ->get()
            ->groupBy('user_id')
            ->map(function ($enrollments) {
            $user = $enrollments->first()->user;
            return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'enrolled_courses' => $enrollments->map(function ($e) {
                    return [
                    'course_id' => $e->course_id,
                    'course_title' => $e->course->title,
                    'enrolled_at' => $e->created_at,
                    'completed_at' => $e->completed_at,
                    ];
                }
                )->values(),
                ];
            })->values();

        return response()->json($students);
    }

    // View student performance
    public function studentPerformance(Request $request, $studentId)
    {
        $courseIds = Course::where('instructor_id', $request->user()->id)->pluck('id');

        $attempts = QuizAttempt::where('user_id', $studentId)
            ->whereHas('quiz', function ($q) use ($courseIds) {
            $q->whereIn('course_id', $courseIds);
        })
            ->with(['quiz:id,title,course_id', 'quiz.course:id,title'])
            ->get();

        return response()->json($attempts);
    }
}
