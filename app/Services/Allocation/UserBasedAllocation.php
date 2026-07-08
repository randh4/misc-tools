<?php

namespace App\Services\Allocation;

class UserBasedAllocation implements StrategyInterface
{
    public function calculate(float $totalBandwidth, array $targets): array
    {
        $totalUsers = 0;
        foreach ($targets as $target) {
            $totalUsers += intval($target['user_count'] ?? 1);
        }

        if ($totalUsers <= 0) {
            return [];
        }

        $result = [];
        foreach ($targets as $target) {
            $users = intval($target['user_count'] ?? 1);
            $allocated = round($totalBandwidth * ($users / $totalUsers), 2);
            $result[] = [
                'name' => $target['name'] ?? 'Target',
                'allocated' => $allocated,
                'details' => 'Users: ' . $users . ' of ' . $totalUsers
            ];
        }
        return $result;
    }

    public function validate(float $totalBandwidth, array $targets): ?string
    {
        if ($totalBandwidth <= 0) {
            return 'Total bandwidth must be greater than 0.';
        }
        if (empty($targets)) {
            return 'At least one target must be added.';
        }
        foreach ($targets as $target) {
            if (empty(trim($target['name'] ?? ''))) {
                return 'All targets must have a name.';
            }
            if (!isset($target['user_count']) || !is_numeric($target['user_count']) || intval($target['user_count']) < 1) {
                return 'User count must be a positive integer (at least 1) for target: ' . ($target['name'] ?? 'Unnamed');
            }
        }
        return null;
    }

    public function getFields(): array
    {
        return [
            [
                'name' => 'user_count',
                'type' => 'number',
                'label' => 'User Count',
                'default' => 10,
                'min' => 1,
                'step' => 1,
                'placeholder' => 'Number of users'
            ]
        ];
    }

    public function getDescription(): string
    {
        return 'Strategi User-Based Allocation membagi kapasitas bandwidth secara proporsional sesuai dengan estimasi atau jumlah pengguna aktif (User Count) di setiap area target.';
    }

    public function getInstruction(): array
    {
        return [
            'Masukkan kapasitas total bandwidth yang tersedia.',
            'Tambahkan daftar target.',
            'Masukkan perkiraan jumlah pengguna (User Count) pada masing-masing target (harus angka positif, minimal 1).',
            'Tekan "Calculate" untuk mendistribusikan bandwidth berdasarkan proporsi jumlah pengguna.'
        ];
    }
}
