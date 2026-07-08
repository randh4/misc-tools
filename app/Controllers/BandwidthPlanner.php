<?php

namespace App\Controllers;

use CodeIgniter\API\ResponseTrait;

/**
 * Controller BandwidthPlanner
 * Mengatur tampilan UI Planner dan request API untuk inisialisasi parameter strategi serta kalkulasi bandwidth.
 */
class BandwidthPlanner extends BaseController
{
    use ResponseTrait;

    /**
     * Pemetaan nama strategi ke class service alokasi masing-masing.
     */
    private array $strategies = [
        'equal'      => \App\Services\Allocation\EqualShare::class,
        'weighted'   => \App\Services\Allocation\WeightedAllocation::class,
        'priority'   => \App\Services\Allocation\PriorityAllocation::class,
        'minimum'    => \App\Services\Allocation\MinimumGuarantee::class,
        'hybrid'     => \App\Services\Allocation\HybridAllocation::class,
        'user_based' => \App\Services\Allocation\UserBasedAllocation::class,
    ];

    /**
     * Menampilkan halaman utama Bandwidth Planner (UI).
     */
    public function index()
    {
        return view('planner/index');
    }

    /**
     * Endpoint API: GET /api/planner/strategies
     * Mengambil daftar seluruh strategi beserta konfigurasi field input, deskripsi, dan petunjuk penggunaannya.
     */
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

    /**
     * Endpoint API: POST /api/planner/calculate
     * Melakukan kalkulasi bandwidth berdasarkan kapasitas total dan parameter target yang dikirim.
     */
    public function calculate()
    {
        // Parsing input raw JSON dari body request
        $json = $this->request->getJSON(true);
        
        $totalBandwidth = $json['total_bandwidth'] ?? null;
        $unit           = $json['unit'] ?? null;
        $strategyKey    = $json['strategy'] ?? null;
        $targets        = $json['targets'] ?? [];

        // Validasi input Kapasitas Total Bandwidth
        if ($totalBandwidth === null || !is_numeric($totalBandwidth) || floatval($totalBandwidth) <= 0) {
            return $this->fail('Total bandwidth must be a positive number.');
        }

        // Validasi unit bandwidth yang diperbolehkan
        if (!in_array($unit, ['Kbps', 'Mbps', 'Gbps'])) {
            return $this->fail('Invalid unit selected.');
        }

        // Validasi kecocokan kunci strategi dengan mapping strategi yang terdaftar
        if (!array_key_exists($strategyKey, $this->strategies)) {
            return $this->fail('Invalid allocation strategy selected.');
        }

        $strategyClass = $this->strategies[$strategyKey];
        $strategy = new $strategyClass();

        // Validasi parameter internal target spesifik strategi (misal: weight > 0, min_alloc <= total, dll.)
        $validationError = $strategy->validate(floatval($totalBandwidth), $targets);
        if ($validationError) {
            return $this->fail($validationError);
        }

        try {
            // Jalankan algoritma kalkulasi alokasi bandwidth
            $allocations = $strategy->calculate(floatval($totalBandwidth), $targets);
        } catch (\Exception $e) {
            return $this->fail('Calculation error: ' . $e->getMessage());
        }

        // Mengembalikan response sukses dalam format JSON
        return $this->respond([
            'status'          => 'success',
            'total_bandwidth' => floatval($totalBandwidth),
            'unit'            => $unit,
            'strategy'        => $strategyKey,
            'allocations'     => $allocations
        ]);
    }
}
