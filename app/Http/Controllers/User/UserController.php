<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Requests\User\UpdateUserRoleRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->with('role:id,code,name')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => Role::query()->orderBy('name')->get(['id', 'name', 'code']),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('users/create', [
            'roles' => Role::query()->orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
            'role_id' => $request->validated('role_id'),
        ]);

        // Accounts created here are trusted by an admin, so skip the email
        // verification flow that self-registered accounts go through.
        $user->forceFill(['email_verified_at' => now()])->save();

        return to_route('users.index')->with('success', "Pengguna {$user->name} berhasil ditambahkan.");
    }

    public function edit(User $user): Response
    {
        return Inertia::render('users/edit', [
            'user' => $user->only(['id', 'name', 'email']),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $user->update([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
        ]);

        if ($password = $request->validated('password')) {
            $user->update(['password' => Hash::make($password)]);
        }

        return to_route('users.index')->with('success', "Pengguna {$user->name} berhasil diperbarui.");
    }

    public function updateRole(UpdateUserRoleRequest $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            return back()->withErrors(['role_id' => 'Anda tidak bisa mengubah role akun sendiri.']);
        }

        $newRole = Role::findOrFail($request->validated('role_id'));

        if ($this->isLastUserWithRolesManage($user) && ! $newRole->hasPermission(Permission::ROLES_MANAGE)) {
            return back()->withErrors([
                'role_id' => 'Tidak bisa mengganti role pengguna ini karena tidak akan ada lagi pengguna yang bisa mengelola role.',
            ]);
        }

        $user->update(['role_id' => $newRole->id]);

        return back()->with('success', "Role {$user->name} berhasil diperbarui.");
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            return back()->withErrors(['user' => 'Anda tidak bisa menghapus akun sendiri.']);
        }

        if ($this->isLastUserWithRolesManage($user)) {
            return back()->withErrors([
                'user' => 'Tidak bisa menghapus pengguna ini karena tidak akan ada lagi yang bisa mengelola role & pengguna.',
            ]);
        }

        try {
            $user->delete();
        } catch (QueryException) {
            return back()->withErrors([
                'user' => 'Pengguna tidak bisa dihapus karena masih memiliki riwayat aktivitas (tiket, inspeksi, log inventaris, dll).',
            ]);
        }

        return to_route('users.index')->with('success', "Pengguna {$user->name} berhasil dihapus.");
    }

    /**
     * Whether removing this user (by deletion or role change) would leave no
     * one able to manage roles & users.
     */
    private function isLastUserWithRolesManage(User $user): bool
    {
        if (! $user->hasPermission(Permission::ROLES_MANAGE)) {
            return false;
        }

        return ! User::query()
            ->whereHas('role.permissions', fn ($query) => $query->where('code', Permission::ROLES_MANAGE))
            ->where('id', '!=', $user->id)
            ->exists();
    }
}
