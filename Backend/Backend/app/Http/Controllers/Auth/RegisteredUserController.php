<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
{
    $request->validate([
        'email' => 'required|string|email|max:255|unique:users',
        'password' => ['required', 'confirmed', Rules\Password::defaults()],
        'use_date_naissance' => 'nullable|date',
        'use_consentement' => 'required|boolean',
    ]);

    $user = User::create([
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'use_date_naissance' => $request->use_date_naissance,
        'use_consentement' => $request->boolean('use_consentement'),
        'use_derniere_connexion' => now(),
    ]);

    event(new Registered($user));
    Auth::login($user);

    return redirect(route('dashboard', absolute: false));
}
}
