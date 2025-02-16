<?php

namespace App\Collection\Miniature;

enum ProgressStatus: string
{
    case Built = 'Built';
    case Gray = 'Gray';
    case Painted = 'Painted';
}
