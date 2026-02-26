<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin',
            'email' => 'admin@lms.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_approved' => true,
        ]);

        // Create a sample instructor (approved)
        User::create([
            'name' => 'John Instructor',
            'email' => 'instructor@lms.com',
            'password' => bcrypt('password'),
            'role' => 'instructor',
            'is_approved' => true,
        ]);

        // Create a sample student
        User::create([
            'name' => 'Jane Student',
            'email' => 'student@lms.com',
            'password' => bcrypt('password'),
            'role' => 'student',
            'is_approved' => true,
        ]);
    }
}
