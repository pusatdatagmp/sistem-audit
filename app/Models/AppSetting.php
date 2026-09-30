<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class AppSetting extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'logo_path',
        'primary_color',
    ];

    /**
     * The system settings are a single row of configuration shared by
     * everyone, so callers always work through this accessor rather than
     * querying the model directly.
     */
    public static function current(): self
    {
        return static::query()->firstOrCreate(['id' => 1]);
    }

    protected function logoUrl(): Attribute
    {
        return Attribute::get(fn () => $this->logo_path ? Storage::disk('public')->url($this->logo_path) : null);
    }

    /**
     * CSS custom property declarations for the admin-chosen brand color, or
     * null when no custom color has been set (fall back to the default
     * theme baked into app.css).
     */
    public function themeCssVariables(): ?string
    {
        if (! $this->primary_color) {
            return null;
        }

        [$hue, $saturation, $lightness] = self::hexToHsl($this->primary_color);
        $primary = "hsl({$hue}, {$saturation}%, {$lightness}%)";
        $foreground = self::isDarkColor($this->primary_color) ? 'hsl(0, 0%, 98%)' : 'hsl(0, 0%, 9%)';

        return "--primary: {$primary}; --primary-foreground: {$foreground}; ".
            "--sidebar-primary: {$primary}; --sidebar-primary-foreground: {$foreground}; ".
            "--sidebar-ring: {$primary}; --ring: {$primary};";
    }

    /**
     * @return array{0: float, 1: float, 2: float} Hue (0-360), saturation and lightness (0-100).
     */
    private static function hexToHsl(string $hex): array
    {
        $hex = ltrim($hex, '#');
        $r = hexdec(substr($hex, 0, 2)) / 255;
        $g = hexdec(substr($hex, 2, 2)) / 255;
        $b = hexdec(substr($hex, 4, 2)) / 255;

        $max = max($r, $g, $b);
        $min = min($r, $g, $b);
        $lightness = ($max + $min) / 2;

        if ($max === $min) {
            return [0.0, 0.0, round($lightness * 100)];
        }

        $delta = $max - $min;
        $saturation = $lightness > 0.5 ? $delta / (2 - $max - $min) : $delta / ($max + $min);

        $hue = match ($max) {
            $r => fmod(($g - $b) / $delta, 6),
            $g => ($b - $r) / $delta + 2,
            default => ($r - $g) / $delta + 4,
        } * 60;

        if ($hue < 0) {
            $hue += 360;
        }

        return [round($hue), round($saturation * 100), round($lightness * 100)];
    }

    private static function isDarkColor(string $hex): bool
    {
        $hex = ltrim($hex, '#');
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));

        $brightness = ($r * 299 + $g * 587 + $b * 114) / 1000;

        return $brightness < 140;
    }
}
