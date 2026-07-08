<?php

namespace App\Services\Allocation;

class HybridAllocation implements StrategyInterface
{
    private array $priorityWeights = [
        'critical' => 4,
        'high'     => 3,
        'medium'   => 2,
        'low'      => 1,
    ];

    public function calculate(float $totalBandwidth, array $targets): array
    {
        $totalMin = 0;
        foreach ($targets as $target) {
            $totalMin += floatval($target['min_alloc'] ?? 0);
        }

        $remaining = $totalBandwidth - $totalMin;
        $totalScore = 0;
        $scores = [];
        
        foreach ($targets as $index => $target) {
            $priority = strtolower($target['priority'] ?? 'medium');
            $priorityMult = $this->priorityWeights[$priority] ?? 2;
            
            $weight = floatval($target['weight'] ?? 1);
            if ($weight < 0.01) $weight = 1;

            $users = intval($target['user_count'] ?? 1);
            if ($users < 1) $users = 1;

            $combinedScore = $priorityMult * $weight * $users;
            $scores[$index] = $combinedScore;
            $totalScore += $combinedScore;
        }

        $result = [];
        foreach ($targets as $index => $target) {
            $min = floatval($target['min_alloc'] ?? 0);
            $score = $scores[$index];
            
            $extraShare = 0;
            if ($totalScore > 0 && $remaining > 0) {
                $extraShare = $remaining * ($score / $totalScore);
            }

            $allocated = $min + $extraShare;
            $result[] = [
                'name' => $target['name'] ?? 'Target',
                'allocated' => round($allocated, 2),
                'details' => 'Min: ' . $min . ' + Share: ' . round($extraShare, 2) . ' (Score: ' . $score . ')'
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
            if (!isset($target['weight']) || !is_numeric($target['weight']) || floatval($target['weight']) <= 0) {
                return 'Weight must be a positive number for target: ' . ($target['name'] ?? 'Unnamed');
            }
            if (!isset($target['user_count']) || !is_numeric($target['user_count']) || intval($target['user_count']) < 1) {
                return 'User count must be a positive integer (at least 1) for target: ' . ($target['name'] ?? 'Unnamed');
            }
            $priority = strtolower($target['priority'] ?? '');
            if (!array_key_exists($priority, $this->priorityWeights)) {
                return 'Invalid priority selected for target: ' . ($target['name'] ?? 'Unnamed');
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
            ],
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
            ],
            [
                'name' => 'weight',
                'type' => 'number',
                'label' => 'Weight',
                'default' => 1,
                'min' => 1,
                'step' => 1,
                'placeholder' => 'Weight value'
            ],
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
        return 'Strategi Hybrid Allocation membagikan jaminan minimum alokasi terlebih dahulu. Jika terdapat sisa bandwidth, sisa tersebut dibagikan secara proporsional berdasarkan kombinasi skor Prioritas, Bobot (Weight), dan Jumlah Pengguna (User Count).';
    }

    public function getInstruction(): array
    {
        return [
            'Masukkan kapasitas total bandwidth yang tersedia.',
            'Isi Minimum Allocation untuk jaminan awal (bisa diisi 0 jika tidak butuh jaminan).',
            'Pilih tingkat Prioritas untuk menentukan pengali skor (Critical x4, Low x1).',
            'Isi nilai Bobot (Weight) untuk perhitungan perbandingan proporsi.',
            'Isi perkiraan jumlah pengguna (User Count) di area target.',
            'Skor total setiap target dihitung berdasarkan perkalian (Prioritas x Bobot x Jumlah Pengguna).',
            'Tekan "Calculate" untuk melihat hasil kalkulasi kombinasi.'
        ];
    }
}
