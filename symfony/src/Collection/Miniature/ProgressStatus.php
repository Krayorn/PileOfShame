<?php

namespace App\Collection\Miniature;

enum ProgressStatus: string
{
    case Build = 'Build';
    case Gray = 'Gray';
    case Painted = 'Painted';
}
