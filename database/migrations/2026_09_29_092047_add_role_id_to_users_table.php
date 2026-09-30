<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('email')->constrained('roles')->restrictOnDelete();
        });

        $roleCodes = DB::table('users')->select('role')->distinct()->pluck('role');

        foreach ($roleCodes as $code) {
            $roleId = DB::table('roles')->where('code', $code)->value('id');

            if (! $roleId) {
                $roleId = DB::table('roles')->insertGetId([
                    'code' => $code,
                    'name' => Str::headline($code),
                    'is_locked' => in_array($code, ['admin', 'reporter', 'driver'], true),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::table('users')->where('role', $code)->update(['role_id' => $roleId]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('role_id');
        });
    }
};
