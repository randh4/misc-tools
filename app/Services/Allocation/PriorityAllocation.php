<?php

namespace App\Services\Allocation;

class PriorityAllocation implements StrategyInterface
{
    private array $priorityWeights = [
        'critical' => 4,
        'high'     => 3,
        'medium'   => 2,
        'low'      => 1,
    ];

    public function calculate(float $totalBandwidth, array $targets): array
    {
        $totalWeight = 0;
        foreach ($targets as $target) {
            $priority = strtolower($target['priority'] ?? 'medium');
            $weight = $this->priorityWeights[$priority] ?? 2;
            $totalWeight += $weight;
        }

        if ($totalWeight <= 0) {
            return [];
        }

        $result = [];
        foreach ($targets as $target) {
            $priority = strtolower($target['priority'] ?? 'medium');
            $weight = $this->priorityWeights[$priority] ?? 2;
            $allocated = round($totalBandwidth * ($weight / $totalWeight), 2);
            $result[] = [
                'name' => $target['name'] ?? 'Target',
                'allocated' => $allocated,
                'details' => 'Priority: ' . ucfirst($priority) . ' (Multiplier x' . $weight . ')'
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
            $priority = strtolower($target['priority'] ?? '');
            if (!array_key_exists($priority, $this->priorityWeights)) {
                return 'Invalid priority selected for target: ' . ($target['name'] ?? 'Unnamed');
            }
        }
        return null;
    }

    public function getFields(): array
    {
        return [
            [
                'name' => 'priority',
                'type' => 'select',
                'label' => 'Priority',
                'default' => 'medium',
                'options' => [
                    'critical' => 'Critical (x4)',
                    'high'     => 'High (x3)',
                    'medium'   => 'Medium (x2)',
                    'low'      => 'Low (x1)'
                ]
            ]
        ];
    }

    public function getDescription(): string
    {
        return 'Strategi Priority Allocation membagi bandwidth berdasarkan tingkat prioritas target. Setiap tingkat prioritas memiliki pengali (multiplier) bobot bawaan: Critical (4x), High (3x), Medium (2x), dan Low (1x).';
    }

    public function getInstruction(): array
    {
        return [
            'Masukkan kapasitas total bandwidth.',
            'Tambahkan daftar target.',
            'Pilih tingkat prioritas dari dropdown untuk masing-masing target.',
            'Bandwidth akan dibagikan secara proporsional sesuai pengali prioritas masing-masing target (Critical mendapat porsi 4 kali lebih besar dibanding Low).',
            'Tekan "Calculate" untuk mengeksekusi perhitungan.'
        ];
    }
}
