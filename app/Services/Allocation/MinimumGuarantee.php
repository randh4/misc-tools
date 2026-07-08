<?php

namespace App\Services\Allocation;

class MinimumGuarantee implements StrategyInterface
{
    public function calculate(float $totalBandwidth, array $targets): array
    {
        $totalMin = 0;
        foreach ($targets as $target) {
            $totalMin += floatval($target['min_alloc'] ?? 0);
        }

        $remaining = $totalBandwidth - $totalMin;
        $count = count($targets);
        $extraShare = ($count > 0 && $remaining > 0) ? round($remaining / $count, 2) : 0;

        $result = [];
        foreach ($targets as $target) {
            $min = floatval($target['min_alloc'] ?? 0);
            $allocated = $min + $extraShare;
            $result[] = [
                'name' => $target['name'] ?? 'Target',
                'allocated' => round($allocated, 2),
                'details' => 'Guaranteed: ' . $min . ' + Share: ' . round($extraShare, 2)
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
        $totalMin = 0;
        foreach ($targets as $target) {
            if (empty(trim($target['name'] ?? ''))) {
                return 'All targets must have a name.';
            }
            if (!isset($target['min_alloc']) || !is_numeric($target['min_alloc']) || floatval($target['min_alloc']) < 0) {
                return 'Minimum allocation must be a non-negative number for target: ' . ($target['name'] ?? 'Unnamed');
            }
            $totalMin += floatval($target['min_alloc']);
        }

        if ($totalMin > $totalBandwidth) {
            return 'Total guaranteed minimum (' . $totalMin . ') exceeds total bandwidth available (' . $totalBandwidth . ').';
        }
        return null;
    }

    public function getFields(): array
    {
        return [
            [
                'name' => 'min_alloc',
                'type' => 'number',
                'label' => 'Min Allocation',
                'default' => 0,
                'min' => 0,
                'step' => 1,
                'placeholder' => 'Min allocation'
            ]
        ];
    }

    public function getDescription(): string
    {
        return 'Strategi Minimum Guarantee memberikan jaminan alokasi bandwidth minimum terlebih dahulu untuk masing-masing target yang membutuhkannya. Sisa bandwidth setelah jaminan minimum terpenuhi akan dibagikan secara merata kepada seluruh target.';
    }

    public function getInstruction(): array
    {
        return [
            'Masukkan kapasitas total bandwidth yang tersedia.',
            'Tambahkan daftar target.',
            'Masukkan nilai Minimum Allocation untuk masing-masing target (tidak boleh negatif).',
            'Pastikan total dari seluruh nilai Minimum Allocation tidak melebihi kapasitas total bandwidth yang diinputkan.',
            'Tekan "Calculate" untuk melihat alokasi final (Jaminan Minimum + Sisa Bandwidth dibagi rata).'
        ];
    }
}
