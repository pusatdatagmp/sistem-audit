<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreMasterDataOptionRequest;
use App\Http\Requests\MasterData\UpdateMasterDataOptionRequest;
use App\Models\MasterDataGroup;
use App\Models\MasterDataOption;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MasterDataOptionController extends Controller
{
    /**
     * Option codes in this group are structurally relied upon by the inventory
     * stock-mutation service (mapped to actual DB columns), so they may never
     * be removed through the admin UI.
     */
    private const PROTECTED_GROUP_CODE = 'physical_condition';

    public function store(StoreMasterDataOptionRequest $request, MasterDataGroup $group): RedirectResponse
    {
        if ($group->code === self::PROTECTED_GROUP_CODE) {
            return back()->withErrors([
                'option' => 'Grup kondisi fisik dikunci karena kodenya terikat langsung ke kolom database sistem stok. Tidak bisa menambah opsi baru di sini.',
            ]);
        }

        $code = $this->uniqueCodeFor($group, $request->string('label')->toString());

        $group->options()->create([
            ...$request->validated(),
            'code' => $code,
            'is_active' => true,
        ]);

        return back()->with('success', 'Opsi berhasil ditambahkan.');
    }

    public function update(UpdateMasterDataOptionRequest $request, MasterDataOption $option): RedirectResponse
    {
        if ($option->group->code === self::PROTECTED_GROUP_CODE) {
            return back()->withErrors([
                'option' => 'Opsi kondisi fisik dikunci dan tidak bisa diubah untuk sementara.',
            ]);
        }

        $option->update($request->validated());

        return back()->with('success', 'Opsi berhasil diperbarui.');
    }

    public function destroy(MasterDataOption $option): RedirectResponse
    {
        if ($option->group->code === self::PROTECTED_GROUP_CODE) {
            return back()->withErrors([
                'option' => 'Opsi kondisi fisik ini dipakai langsung oleh sistem mutasi stok dan tidak bisa dihapus. Nonaktifkan saja jika tidak ingin dipakai.',
            ]);
        }

        try {
            $option->delete();
        } catch (QueryException) {
            return back()->withErrors(['option' => 'Opsi tidak bisa dihapus karena masih digunakan di data lain. Nonaktifkan saja opsi ini.']);
        }

        return back()->with('success', 'Opsi berhasil dihapus.');
    }

    private function uniqueCodeFor(MasterDataGroup $group, string $label): string
    {
        $base = Str::slug($label);

        if ($base === '') {
            throw ValidationException::withMessages(['label' => 'Label tidak valid untuk dijadikan kode opsi.']);
        }

        $code = $base;
        $suffix = 2;

        while ($group->options()->where('code', $code)->exists()) {
            $code = "{$base}-{$suffix}";
            $suffix++;
        }

        return $code;
    }
}
