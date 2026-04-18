<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>{{ config('app.name', 'Femi9 Billing') }}</title>

        <!-- Favicon -->
        <link rel="shortcut icon" href="/favicon.png">
        <link rel="apple-touch-icon" href="/apple-icon.png">

        @viteReactRefresh
        @vite(['resources/js/main.tsx'])
    </head>
    <body>
        <div id="root"></div>
    </body>
</html>
