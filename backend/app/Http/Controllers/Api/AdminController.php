<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // List instructors
    public function instructors()
    {
        $instructors = User::where('role', 'instructor')
            ->withCount('courses')
            ->get();

        return response()->json($instructors);
    }

    // Approve instructor
    public function approveInstructor($id)
    {
        $instructor = User::where('role', 'instructor')->findOrFail($id);
        $instructor->update(['is_approved' => true]);

        return response()->json(['message' => 'Instructor approved', 'instructor' => $instructor]);
    }

    // Reject instructor
    public function rejectInstructor($id)
    {
        $instructor = User::where('role', 'instructor')->findOrFail($id);
        $instructor->update(['is_approved' => false]);

        return response()->json(['message' => 'Instructor rejected', 'instructor' => $instructor]);
    }

    // List students
    public function students()
    {
        $students = User::where('role', 'student')
            ->withCount('enrollments')
            ->get();

        return response()->json($students);
    }

    // Block/unblock student
    public function toggleBlockStudent($id)
    {
        $student = User::where('role', 'student')->findOrFail($id);
        $student->update(['is_blocked' => !$student->is_blocked]);

        $status = $student->is_blocked ? 'blocked' : 'unblocked';

        return response()->json(['message' => "Student {$status}", 'student' => $student]);
    }

    // List all courses
    public function courses()
    {
        $courses = Course::with('instructor:id,name')
            ->withCount('enrollments', 'materials', 'quizzes')
            ->get();

        return response()->json($courses);
    }

    // Approve course
    public function approveCourse($id)
    {
        $course = Course::findOrFail($id);
        $course->update(['status' => 'approved']);

        return response()->json(['message' => 'Course approved', 'course' => $course]);
    }

    // Reject course
    public function rejectCourse($id)
    {
        $course = Course::findOrFail($id);
        $course->update(['status' => 'rejected']);

        return response()->json(['message' => 'Course rejected', 'course' => $course]);
    }

    // System analytics
    public function analytics()
    {
        return response()->json([
            'total_users' => User::count(),
            'total_students' => User::where('role', 'student')->count(),
            'total_instructors' => User::where('role', 'instructor')->count(),
            'approved_instructors' => User::where('role', 'instructor')->where('is_approved', true)->count(),
            'total_courses' => Course::count(),
            'approved_courses' => Course::where('status', 'approved')->count(),
            'pending_courses' => Course::where('status', 'pending')->count(),
            'total_enrollments' => Enrollment::count(),
            'completed_enrollments' => Enrollment::whereNotNull('completed_at')->count(),
        ]);
    }
}
