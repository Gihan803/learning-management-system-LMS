<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'instructor_id',
        'title',
        'description',
        'thumbnail',
        'status',
    ];

    public function instructor()
    {
        return $this->belongsTo(User::class , 'instructor_id');
    }

    public function materials()
    {
        return $this->hasMany(Material::class)->orderBy('sort_order');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function students()
    {
        return $this->belongsToMany(User::class , 'enrollments');
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }
}
