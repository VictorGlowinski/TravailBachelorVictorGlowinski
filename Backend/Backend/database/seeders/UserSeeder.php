<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         User::create([
            'email' => 'admin@example.com',
            'password' => Hash::make('admin'), 
            'use_date_naissance' => '1990-01-01',
            'use_consentement' => true,
            'use_derniere_connexion' => now(),
        ]);

        User::create([
            'email' => 'test@example.com',
            'password' => Hash::make('1234'),
            'use_date_naissance' => '1995-05-15',
            'use_consentement' => true,
            'use_derniere_connexion' => now(),
        ]);
        User::create([
            'email' => 'user2@example.com',
            'password' => Hash::make('1234'),
            'use_date_naissance' => '1992-03-20',
            'use_consentement' => true,
            'use_derniere_connexion' => now(),
        ]);
    }
}
