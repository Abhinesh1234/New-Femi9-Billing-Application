<?php

namespace App\Console\Commands;

use App\Models\Party;
use App\Models\PartyUser;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SeedPartyCredentials extends Command
{
    protected $signature   = 'party:seed-credentials
                              {--output= : Path for the CSV export (default: storage/app/party_credentials.csv)}
                              {--all     : Include all active parties (default: only portal-enabled)}
                              {--force   : Re-generate password even if a party_user already exists}';

    protected $description = 'Create portal login credentials for existing parties and export to CSV';

    public function handle(): int
    {
        $outputPath = $this->option('output')
            ?? storage_path('app/party_credentials.csv');

        $includeAll = (bool) $this->option('all');
        $force      = (bool) $this->option('force');

        $this->info('Loading parties…');

        $query = Party::with('distributionCategory')
            ->where('is_active', true)
            ->whereNotNull('mobile')
            ->where('mobile', '!=', '');

        if (!$includeAll) {
            $query->where('enable_portal', true);
        }

        $parties = $query->orderBy('id')->get();

        $this->info("Found {$parties->count()} parties. Generating credentials…");

        $rows    = [];
        $created = 0;
        $skipped = 0;

        $bar = $this->output->createProgressBar($parties->count());
        $bar->start();

        foreach ($parties as $party) {
            $bar->advance();

            // Check if a party_user already exists for this party
            $existing = PartyUser::where('party_id', $party->id)
                ->whereNull('deleted_at')
                ->first();

            if ($existing && !$force) {
                $rows[] = [
                    'Party ID'              => $party->id,
                    'Party Name'            => $party->display_name,
                    'Mobile'                => $party->mobile,
                    'Email'                 => $party->email ?? '',
                    'Login (Mobile)'        => $party->mobile,
                    'Password'              => '(already set — use reset to change)',
                    'Portal Enabled'        => 'Yes',
                    'Distribution Category' => optional($party->distributionCategory)->name ?? '',
                    'Status'                => 'Existing',
                ];
                $skipped++;
                continue;
            }

            // Generate a secure password: Party@XXXX00 format
            $plain = $this->generatePassword();

            if ($existing && $force) {
                $existing->update([
                    'password'  => Hash::make($plain),
                    'is_active' => true,
                ]);
                $partyUser = $existing;
            } else {
                $partyUser = PartyUser::create([
                    'party_id'  => $party->id,
                    'name'      => $party->display_name,
                    'mobile'    => $party->mobile,
                    'email'     => $party->email ?: null,
                    'password'  => Hash::make($plain),
                    'is_active' => true,
                ]);
            }

            // Enable portal on the party
            if (!$party->enable_portal) {
                $party->update(['enable_portal' => true]);
            }

            $rows[] = [
                'Party ID'              => $party->id,
                'Party Name'            => $party->display_name,
                'Mobile'                => $party->mobile,
                'Email'                 => $party->email ?? '',
                'Login (Mobile)'        => $party->mobile,
                'Password'              => $plain,
                'Portal Enabled'        => 'Yes',
                'Distribution Category' => optional($party->distributionCategory)->name ?? '',
                'Status'                => ($existing && $force) ? 'Reset' : 'New',
            ];

            $created++;
        }

        $bar->finish();
        $this->newLine(2);

        // Write CSV with UTF-8 BOM (so Excel opens it correctly)
        $this->writeCsv($outputPath, $rows);

        $this->info("✓ Credentials created: {$created}  |  Skipped (existing): {$skipped}");
        $this->info("✓ CSV exported to: {$outputPath}");

        return self::SUCCESS;
    }

    private function generatePassword(): string
    {
        // Format: Femi9@XXXXXN  (uppercase prefix + special + random upper/lower + digits)
        // Always satisfies: min 8, has uppercase, has digit, has special char
        $upper   = strtoupper(Str::random(3));
        $digits  = rand(100, 999);
        $lower   = strtolower(Str::random(2));
        return "Fe@{$upper}{$digits}{$lower}";
    }

    private function writeCsv(string $path, array $rows): void
    {
        $dir = dirname($path);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $fp = fopen($path, 'w');

        // UTF-8 BOM for Excel
        fwrite($fp, "\xEF\xBB\xBF");

        if (!empty($rows)) {
            // Header row
            fputcsv($fp, array_keys($rows[0]));

            foreach ($rows as $row) {
                fputcsv($fp, array_values($row));
            }
        }

        fclose($fp);
    }
}
