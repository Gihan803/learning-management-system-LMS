<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaterialCompletion extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'material_id',
    ];

    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }
}
