<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateSystemSettingRequest;
use App\Models\AppSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingController extends Controller
{
    public function edit(): Response
    {
        $setting = AppSetting::current();

        return Inertia::render('system-settings/edit', [
            'setting' => [
                'logo_url' => $setting->logo_url,
                'primary_color' => $setting->primary_color,
            ],
        ]);
    }

    public function update(UpdateSystemSettingRequest $request): RedirectResponse
    {
        $setting = AppSetting::current();

        if ($request->boolean('remove_logo') && $setting->logo_path) {
            Storage::disk('public')->delete($setting->logo_path);
            $setting->logo_path = null;
        }

        if ($request->hasFile('logo')) {
            if ($setting->logo_path) {
                Storage::disk('public')->delete($setting->logo_path);
            }

            $setting->logo_path = $request->file('logo')->store('branding', 'public');
        }

        $setting->primary_color = $request->validated('primary_color') ?: null;
        $setting->save();

        return back()->with('success', 'Pengaturan sistem berhasil disimpan.');
    }
}
