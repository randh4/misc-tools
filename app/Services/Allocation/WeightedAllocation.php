<?php

namespace App\Services\Allocation;

class WeightedAllocation implements StrategyInterface
{
    public function calculate(float $totalBandwidth, array $targets): array
    {
        $totalWeight = 0;
        foreach ($targets as $target) {
            $weight = floatval($target['weight'] ?? 1);
            if ($weight < 0.01) {
                $weight = 1;
            }
            $totalWeight += $weight;
        }

        if ($totalWeight <= 0) {
            return [];
        }

        $result = [];
        foreach ($targets as $target) {
            $weight = floatval($target['weight'] ?? 1);
            if ($weight < 0.01) {
                $weight = 1;
            }
            $allocated = round($totalBandwidth * ($weight / $totalWeight), 2);
            $result[] = [
                'name' => $target['name'] ?? 'Target',
                'allocated' => $allocated,
                'details' => 'Weight: ' . $weight . ' of ' . $totalWeight
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
            if (!isset($target['weight']) || !is_numeric($target['weight']) || floatval($target['weight']) <= 0) {
                return 'Weight must be a positive number for target: ' . ($target['name'] ?? 'Unnamed');
            }
        }
        return null;
    }

    public function getFields(): array
    {
        return [
            [
                'name' => 'weight',
                'type' => 'number',
                'label' => 'Weight',
                'default' => 1,
                'min' => 1,
                'step' => 1,
                'placeholder' => 'Weight value'
            ]
        ];
    }

    public function getDescription(): string
    {
        return 'Strategi Weighted Allocation membagi bandwidth secara proporsional berdasarkan bobot (weight) yang diberikan pada masing-masing target. Semakin besar bobot suatu target, semakin besar porsi bandwidth yang didapatkannya.';
    }

    public function getInstruction(): array
    {
        return [
            'Masukkan kapasitas total bandwidth yang tersedia.',
            'Tambahkan target yang diinginkan.',
            'Masukkan nilai Bobot (Weight) untuk masing-masing target (angka bulat positif, minimal 1). Contoh: Target A bobot 3, Target B bobot 1. Maka Target A mendapat 3/4 bagian dan Target B mendapat 1/4 bagian.',
            'Tekan "Calculate" untuk melihat pembagian proporsional.'
        ];
    }
}
