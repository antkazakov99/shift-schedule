<?php

namespace App\Providers;

use Illuminate\Foundation\Console\ServeCommand;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // `artisan serve` starts `php -S` with a whitelisted environment. Without TEMP/TMP on Windows
        // SQLite cannot create its temp files and writes inside transactions fail with
        // "unable to open database file".
        if ($this->app->runningInConsole()) {
            array_push(ServeCommand::$passthroughVariables, 'TEMP', 'TMP', 'TMPDIR');
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
