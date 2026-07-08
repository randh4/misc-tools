<?php

namespace App\Services\Allocation;

class EqualShare implements StrategyInterface
{
    public function calculate(float $totalBandwidth, array $targets): array
    {
        $count = count($targets);
        if ($count === 0) {
            return [];
        }

        $share = round($totalBandwidth / $count, 2);
        $result = [];
        foreach ($targets as $target) {
            $result[] = [
                'name' => $target['name'] ?? 'Target',
                'allocated' => $share,
                'details' => 'Equal share of total bandwidth'
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
        }
        return null;
    }

    public function getFields(): array
    {
        return [];
    }

    public function getDescription(): string
    {
        return 'Strategi Equal Share membagi kapasitas total bandwidth secara merata kepada semua target yang didaftarkan tanpa memandang prioritas atau beban kerja.';
    }

    public function getInstruction(): array
    {
        return [
            'Masukkan kapasitas total bandwidth yang ingin dialokasikan.',
            'Tambahkan daftar target (contoh: VLAN, Area, Divisi) dengan menekan tombol "Add Target".',
            'Isi nama target masing-masing secara jelas.',
            'Tekan "Calculate" untuk melihat pembagian rata bandwidth.'
        ];
    }
}
