<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InstructorController;
use App\Http\Controllers\Api\StudentController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class , 'register']);
Route::post('/login', [AuthController::class , 'login']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class , 'logout']);
    Route::get('/user', [AuthController::class , 'user']);

    // Student routes
    Route::middleware('role:student')->group(function () {
            Route::get('/courses', [StudentController::class , 'courses']);
            Route::get('/courses/{id}', [StudentController::class , 'courseDetail']);
            Route::post('/courses/{id}/enroll', [StudentController::class , 'enroll']);
            Route::get('/enrollments', [StudentController::class , 'myEnrollments']);
            Route::post('/materials/{materialId}/complete', [StudentController::class , 'completeMaterial']);
            Route::post('/quizzes/{quizId}/attempt', [StudentController::class , 'submitQuiz']);
            Route::get('/progress', [StudentController::class , 'progress']);
        }
        );

        // Instructor routes
        Route::middleware('role:instructor')->prefix('instructor')->group(function () {
            Route::get('/courses', [InstructorController::class , 'courses']);
            Route::post('/courses', [InstructorController::class , 'createCourse']);
            Route::put('/courses/{id}', [InstructorController::class , 'updateCourse']);
            Route::delete('/courses/{id}', [InstructorController::class , 'deleteCourse']);
            Route::post('/courses/{courseId}/materials', [InstructorController::class , 'addMaterial']);
            Route::delete('/materials/{materialId}', [InstructorController::class , 'deleteMaterial']);
            Route::post('/courses/{courseId}/quizzes', [InstructorController::class , 'createQuiz']);
            Route::post('/quizzes/{quizId}/questions', [InstructorController::class , 'addQuestions']);
            Route::delete('/quizzes/{quizId}', [InstructorController::class , 'deleteQuiz']);
            Route::get('/students', [InstructorController::class , 'enrolledStudents']);
            Route::get('/students/{studentId}/performance', [InstructorController::class , 'studentPerformance']);
        }
        );

        // Admin routes
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('/instructors', [AdminController::class , 'instructors']);
            Route::put('/instructors/{id}/approve', [AdminController::class , 'approveInstructor']);
            Route::put('/instructors/{id}/reject', [AdminController::class , 'rejectInstructor']);
            Route::get('/students', [AdminController::class , 'students']);
            Route::put('/students/{id}/toggle-block', [AdminController::class , 'toggleBlockStudent']);
            Route::get('/courses', [AdminController::class , 'courses']);
            Route::put('/courses/{id}/approve', [AdminController::class , 'approveCourse']);
            Route::put('/courses/{id}/reject', [AdminController::class , 'rejectCourse']);
            Route::get('/analytics', [AdminController::class , 'analytics']);
        }
        );    });
