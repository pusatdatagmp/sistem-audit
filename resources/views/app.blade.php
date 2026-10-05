<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        @php $appSettings = \App\Models\AppSetting::current(); @endphp
        <link rel="icon" href="{{ $appSettings->logo_url ?? asset('favicon.ico') }}">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead

        @php $themeCssVariables = $appSettings->themeCssVariables(); @endphp
        @if ($themeCssVariables)
            <style>
                :root {
                    {{ $themeCssVariables }}
                }
                .dark {
                    {{ $themeCssVariables }}
                }
            </style>
        @endif
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
