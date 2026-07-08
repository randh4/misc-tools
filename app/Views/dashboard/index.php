<?= $this->extend('layout') ?>

<?= $this->section('content') ?>
<div class="row">
    <!-- Hero Section -->
    <div class="col-12 mb-4">
        <div class="card bg-white border-0 overflow-hidden" style="position: relative;">
            <div class="card-body p-5">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <h1 class="display-5 fw-bold text-dark mb-3">Welcome to NetTools Platform</h1>
                        <p class="fs-5 text-muted mb-4">
                            A clean, lightweight, vendor-independent web utility designed for Network Engineers, IT Support, and System Administrators to analyze, plan, and optimize networks.
                        </p>
                        <a href="<?= base_url('planner') ?>" class="btn btn-primary btn-lg px-4 py-2">
                            <i class="bx bx-calculator me-2"></i> Launch Bandwidth Planner
                        </a>
                    </div>
                    <div class="col-lg-4 text-center d-none d-lg-block">
                        <i class="bx bx-network-chart text-primary" style="font-size: 10rem; opacity: 0.15;"></i>
                    </div>
                </div>
            </div>
            <!-- Decorative Accent line -->
            <div style="height: 5px; background-color: var(--accent-color); width: 100%; position: absolute; bottom: 0; left: 0;"></div>
        </div>
    </div>

    <!-- Available Tools -->
    <div class="col-lg-6 col-12 mb-4">
        <div class="card h-100 border-0">
            <div class="card-header d-flex align-items-center gap-2">
                <i class="bx bx-run fs-3 text-primary"></i>
                <h4 class="m-0 fw-bold">Available Utilities</h4>
            </div>
            <div class="card-body py-4">
                <div class="d-flex align-items-start gap-3 p-3 rounded bg-light border-start border-primary border-4 mb-3">
                    <div class="bg-white p-2 rounded shadow-sm text-primary">
                        <i class="bx bx-pie-chart-alt-2 fs-2"></i>
                    </div>
                    <div class="flex-grow-1">
                        <h5 class="fw-bold mb-1">Bandwidth Allocation Planner</h5>
                        <p class="text-muted small mb-2">Determine optimal bandwidth allocation recommended for users/servers/areas based on multiple strategy rules (Equal, Weighted, Priority, Min Guarantee).</p>
                        <a href="<?= base_url('planner') ?>" class="btn btn-outline-primary btn-sm">Open Planner</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Coming Soon Tools -->
    <div class="col-lg-6 col-12 mb-4">
        <div class="card h-100 border-0">
            <div class="card-header d-flex align-items-center gap-2">
                <i class="bx bx-time fs-3 text-warning"></i>
                <h4 class="m-0 fw-bold">Coming Soon Roadmap</h4>
            </div>
            <div class="card-body">
                <div class="row g-2">
                    <?php
                    $comingSoon = [
                        ['icon' => 'bx-layer', 'name' => 'Subnet Calculator'],
                        ['icon' => 'bx-slider-alt', 'name' => 'CIDR Calculator'],
                        ['icon' => 'bx-grid-alt', 'name' => 'VLSM Calculator'],
                        ['icon' => 'bx-shuffle', 'name' => 'QoS Calculator'],
                        ['icon' => 'bx-trending-down', 'name' => 'Packet Loss Analyser'],
                        ['icon' => 'bx-timer', 'name' => 'Delay Calculator'],
                        ['icon' => 'bx-expand', 'name' => 'MTU Calculator'],
                        ['icon' => 'bx-tachometer', 'name' => 'Throughput Calculator'],
                        ['icon' => 'bx-file', 'name' => 'Network Doc Generator']
                    ];
                    foreach ($comingSoon as $tool):
                    ?>
                    <div class="col-md-6 col-12">
                        <div class="d-flex align-items-center gap-2 p-2 border rounded bg-light" style="opacity: 0.7;">
                            <i class="bx <?= $tool['icon'] ?> text-muted fs-4"></i>
                            <span class="small fw-semibold text-muted"><?= $tool['name'] ?></span>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</div>
<?= $this->endSection() ?>
