<?php

namespace App\Controllers;

use CodeIgniter\API\ResponseTrait;

class BandwidthPlanner extends BaseController
{
    use ResponseTrait;

    private array $strategies = [
        'equal'    => \App\Services\Allocation\EqualShare::class,
        'weighted' => \App\Services\Allocation\WeightedAllocation::class,
        'priority' => \App\Services\Allocation\PriorityAllocation::class,
        'minimum'  => \App\Services\Allocation\MinimumGuarantee::class,
        'hybrid'   => \App\Services\Allocation\HybridAllocation::class,
    ];

    public function index()
    {
        return view('planner/index');
    }

    public function strategies()
    {
        $data = [];
        foreach ($this->strategies as $key => $class) {
            $instance = new $class();
            $data[$key] = [
                'name' => ucwords(str_replace('_', ' ', $key)),
                'fields' => $instance->getFields(),
                'description' => $instance->getDescription(),
                'instruction' => $instance->getInstruction()
            ];
        }
        return $this->respond($data);
    }

    public function calculate()
    {
        $json = $this->request->getJSON(true);
        
        $totalBandwidth = $json['total_bandwidth'] ?? null;
        $unit           = $json['unit'] ?? null;
        $strategyKey    = $json['strategy'] ?? null;
        $targets        = $json['targets'] ?? [];

        if ($totalBandwidth === null || !is_numeric($totalBandwidth) || floatval($totalBandwidth) <= 0) {
            return $this->fail('Total bandwidth must be a positive number.');
        }

        if (!in_array($unit, ['Kbps', 'Mbps', 'Gbps'])) {
            return $this->fail('Invalid unit selected.');
        }

        if (!array_key_exists($strategyKey, $this->strategies)) {
            return $this->fail('Invalid allocation strategy selected.');
        }

        $strategyClass = $this->strategies[$strategyKey];
        $strategy = new $strategyClass();

        $validationError = $strategy->validate(floatval($totalBandwidth), $targets);
        if ($validationError) {
            return $this->fail($validationError);
        }

        try {
            $allocations = $strategy->calculate(floatval($totalBandwidth), $targets);
        } catch (\Exception $e) {
            return $this->fail('Calculation error: ' . $e->getMessage());
        }

        return $this->respond([
            'status'          => 'success',
            'total_bandwidth' => floatval($totalBandwidth),
            'unit'            => $unit,
            'strategy'        => $strategyKey,
            'allocations'     => $allocations
        ]);
    }
}
