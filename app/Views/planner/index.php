<?= $this->extend('layout') ?>

<?= $this->section('content') ?>
<div class="row">
    <!-- Planner Configuration Card -->
    <div class="col-lg-7 col-12 mb-4">
        <div class="card border-0">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h4 class="m-0 fw-bold text-dark"><i class="bx bx-cog me-2 text-primary"></i>Configurator</h4>
                <button type="button" class="btn btn-sm btn-outline-primary" id="btn-add-target">
                    <i class="bx bx-plus me-1"></i> Add Target
                </button>
            </div>
            <div class="card-body py-4">
                <form id="planner-form" novalidate>
                    <!-- Bandwidth Capacity Config -->
                    <div class="row g-3 mb-4">
                        <div class="col-md-8 col-12">
                            <label for="total_bandwidth" class="form-label fw-semibold">Total Capacity Bandwidth</label>
                            <div class="input-group">
                                <input type="number" class="form-control" id="total_bandwidth" name="total_bandwidth" placeholder="e.g. 100" min="0.1" step="any" required>
                                <select class="form-select" id="unit" name="unit" style="max-width: 120px;">
                                    <option value="Mbps" selected>Mbps</option>
                                    <option value="Kbps">Kbps</option>
                                    <option value="Gbps">Gbps</option>
                                </select>
                                <div class="invalid-feedback">Please enter a valid positive number for bandwidth.</div>
                            </div>
                        </div>
                        <div class="col-md-4 col-12">
                            <label for="strategy" class="form-label fw-semibold d-flex align-items-center">
                                Allocation Strategy
                                <i id="btn-strategy-info" class="bx bx-info-circle text-primary ms-2" style="font-size: 1.1rem; cursor: pointer;" title="Show Strategy Details"></i>
                            </label>
                            <select class="form-select" id="strategy" name="strategy">
                                <option value="equal" selected>Equal Share</option>
                                <option value="weighted">Weighted Allocation</option>
                                <option value="priority">Priority Allocation</option>
                                <option value="minimum">Minimum Guarantee</option>
                            </select>
                        </div>
                    </div>

                    <!-- Target Lists Table -->
                    <h5 class="fw-bold mb-3 text-dark"><i class="bx bx-list-ul me-2"></i>Targets</h5>
                    <div class="table-responsive mb-4" style="max-height: 350px; overflow-y: auto;">
                        <table class="table table-hover align-middle" id="targets-table">
                            <thead class="table-light">
                                <tr>
                                    <th style="min-width: 200px;">Target Name</th>
                                    <th id="dynamic-header" class="d-none">Parameter</th>
                                    <th style="width: 50px;">Action</th>
                                </tr>
                            </thead>
                            <tbody id="targets-tbody">
                                <!-- Target Rows dynamically injected here -->
                            </tbody>
                        </table>
                    </div>

                    <!-- Error Alert -->
                    <div class="alert alert-danger d-none" id="form-error-alert" role="alert">
                        <i class="bx bx-error-alt me-2"></i><span id="error-message"></span>
                    </div>

                    <!-- Action Button -->
                    <div class="d-grid">
                        <button type="submit" class="btn btn-primary btn-lg" id="btn-calculate">
                            <i class="bx bx-calculator me-2"></i> Calculate Recommended Allocation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Output & Results Card -->
    <div class="col-lg-5 col-12 mb-4">
        <!-- Placeholder when no result -->
        <div class="card h-100 border-0 text-center py-5 d-flex align-items-center justify-content-center" id="results-placeholder">
            <div class="py-5">
                <i class="bx bx-bar-chart-alt-2 display-1 text-muted opacity-50 mb-3 animate-pulse"></i>
                <h4 class="text-muted fw-bold">No Calculations Yet</h4>
                <p class="text-muted px-4">Fill in the configurator on the left and click calculate to view recommendations.</p>
            </div>
        </div>

        <!-- Output Result Panel -->
        <div class="card border-0 d-none" id="results-panel">
            <div class="card-header">
                <h4 class="m-0 fw-bold text-dark"><i class="bx bx-pie-chart-alt-2 me-2 text-success"></i>Results Recommendation</h4>
            </div>
            <div class="card-body">
                <!-- Summary badge metrics -->
                <div class="d-flex flex-wrap gap-2 mb-3">
                    <span class="badge bg-secondary p-2" id="summary-capacity">Capacity: -</span>
                    <span class="badge bg-primary p-2" id="summary-strategy">Strategy: -</span>
                    <span class="badge bg-info p-2" id="summary-targets">Targets: -</span>
                </div>

                <!-- Chart Container -->
                <div class="mb-4 d-flex justify-content-center" style="max-height: 250px;">
                    <canvas id="allocation-chart"></canvas>
                </div>

                <!-- Result Table -->
                <h5 class="fw-bold mb-3 text-dark">Allocation Table</h5>
                <div class="table-responsive">
                    <table class="table table-striped table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Target</th>
                                <th class="text-end">Allocation</th>
                                <th class="text-end">Share %</th>
                            </tr>
                        </thead>
                        <tbody id="results-tbody">
                            <!-- Injected by JS -->
                        </tbody>
                        <tfoot class="table-light fw-bold">
                            <tr>
                                <td>Total Allocated</td>
                                <td class="text-end" id="results-total-allocated">-</td>
                                <td class="text-end">100%</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Strategy Info Modal -->
<div class="modal fade" id="strategyInfoModal" tabindex="-1" aria-labelledby="strategyInfoModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
            <div class="modal-header border-bottom">
                <h5 class="modal-title fw-bold text-dark d-flex align-items-center" id="strategyInfoModalLabel">
                    <i class="bx bx-info-circle text-primary me-2 fs-4"></i>
                    <span id="modal-strategy-name">Strategy Name</span>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <h6 class="fw-bold text-dark mb-2">Deskripsi:</h6>
                <p class="text-muted mb-4" id="modal-strategy-description"></p>
                
                <h6 class="fw-bold text-dark mb-2">Instruksi Penggunaan:</h6>
                <ol class="ps-3 text-muted mb-0" id="modal-strategy-instructions">
                    <!-- Dynamic Instructions list -->
                </ol>
            </div>
            <div class="modal-footer border-top">
                <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>
<?= $this->endSection() ?>

<?= $this->section('scripts') ?>
<script>
document.addEventListener('DOMContentLoaded', function () {
    const strategySelect = document.getElementById('strategy');
    const btnStrategyInfo = document.getElementById('btn-strategy-info');
    const targetsTbody = document.getElementById('targets-tbody');
    const btnAddTarget = document.getElementById('btn-add-target');
    const dynamicHeader = document.getElementById('dynamic-header');
    const plannerForm = document.getElementById('planner-form');
    const formErrorAlert = document.getElementById('form-error-alert');
    const errorMessage = document.getElementById('error-message');
    const resultsPlaceholder = document.getElementById('results-placeholder');
    const resultsPanel = document.getElementById('results-panel');
    const resultsTbody = document.getElementById('results-tbody');
    
    let strategiesConfig = {};
    let chartInstance = null;

    // Show strategy info modal
    btnStrategyInfo.addEventListener('click', function () {
        const strategy = strategySelect.value;
        const config = strategiesConfig[strategy];
        if (!config) return;

        document.getElementById('modal-strategy-name').textContent = config.name;
        document.getElementById('modal-strategy-description').textContent = config.description || 'No description available.';
        
        const instructionsList = document.getElementById('modal-strategy-instructions');
        instructionsList.innerHTML = '';
        
        if (config.instruction && Array.isArray(config.instruction)) {
            config.instruction.forEach(inst => {
                const li = document.createElement('li');
                li.className = 'mb-1';
                li.textContent = inst;
                instructionsList.appendChild(li);
            });
        } else {
            instructionsList.innerHTML = '<li>No instructions available.</li>';
        }

        const modal = new bootstrap.Modal(document.getElementById('strategyInfoModal'));
        modal.show();
    });

    // Default target suggestions
    const initialTargets = ['VLAN 10 - Management', 'VLAN 20 - Staff', 'VLAN 30 - Guest'];

    // Load strategies definition
    fetch('<?= base_url('api/planner/strategies') ?>')
        .then(res => res.json())
        .then(data => {
            strategiesConfig = data;
            // Initialize with default targets
            initialTargets.forEach(name => addTargetRow(name));
            updateDynamicFields();
        })
        .catch(err => console.error("Error loading strategies configurations", err));

    strategySelect.addEventListener('change', updateDynamicFields);
    btnAddTarget.addEventListener('click', () => addTargetRow());

    function updateDynamicFields() {
        const strategy = strategySelect.value;
        const config = strategiesConfig[strategy] || { fields: [] };
        
        if (config.fields.length > 0) {
            dynamicHeader.textContent = config.fields[0].label;
            dynamicHeader.classList.remove('d-none');
        } else {
            dynamicHeader.classList.add('d-none');
        }

        // Update each row's parameter input cell
        const rows = targetsTbody.querySelectorAll('tr');
        rows.forEach(row => {
            const paramCell = row.querySelector('.param-cell');
            if (config.fields.length > 0) {
                paramCell.classList.remove('d-none');
                const field = config.fields[0];
                const inputHtml = renderField(field, row.dataset.id);
                paramCell.innerHTML = inputHtml;
            } else {
                paramCell.classList.add('d-none');
                paramCell.innerHTML = '';
            }
        });
    }

    function renderField(field, rowId) {
        if (field.type === 'select') {
            let options = '';
            for (const [val, label] of Object.entries(field.options)) {
                const selected = val === field.default ? 'selected' : '';
                options += `<option value="${val}" ${selected}>${label}</option>`;
            }
            return `<select class="form-select param-input" data-name="${field.name}" required>${options}</select>`;
        } else if (field.type === 'number') {
            return `<input type="number" class="form-control param-input" data-name="${field.name}" 
                           min="${field.min !== undefined ? field.min : ''}" 
                           step="${field.step !== undefined ? field.step : 'any'}"
                           value="${field.default}" placeholder="${field.placeholder || ''}" required>`;
        }
        return '';
    }

    function addTargetRow(name = '') {
        const rowId = 'row-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const tr = document.createElement('tr');
        tr.dataset.id = rowId;

        const strategy = strategySelect.value;
        const config = strategiesConfig[strategy] || { fields: [] };
        const hasFields = config.fields.length > 0;

        tr.innerHTML = `
            <td>
                <input type="text" class="form-control target-name" value="${name}" placeholder="e.g. VLAN 10, Division A" required>
            </td>
            <td class="param-cell ${hasFields ? '' : 'd-none'}">
                <!-- dynamic input injected here -->
            </td>
            <td>
                <button type="button" class="btn btn-outline-danger btn-sm btn-delete-row">
                    <i class="bx bx-trash"></i>
                </button>
            </td>
        `;

        // Event listener for delete button
        tr.querySelector('.btn-delete-row').addEventListener('click', function () {
            tr.remove();
        });

        targetsTbody.appendChild(tr);

        // Render dynamic field if active
        if (hasFields) {
            const paramCell = tr.querySelector('.param-cell');
            const field = config.fields[0];
            paramCell.innerHTML = renderField(field, rowId);
        }
    }

    plannerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        formErrorAlert.classList.add('d-none');

        // Form Validation Check
        if (!plannerForm.checkValidity()) {
            plannerForm.classList.add('was-validated');
            return;
        }

        const totalBandwidth = parseFloat(document.getElementById('total_bandwidth').value);
        const unit = document.getElementById('unit').value;
        const strategy = strategySelect.value;

        // Build targets array
        const targets = [];
        const rows = targetsTbody.querySelectorAll('tr');
        if (rows.length === 0) {
            showError('Please add at least one target.');
            return;
        }

        for (const row of rows) {
            const name = row.querySelector('.target-name').value.trim();
            if (!name) {
                showError('All targets must have a name.');
                return;
            }

            const targetObj = { name: name };

            const paramInput = row.querySelector('.param-input');
            if (paramInput) {
                const paramName = paramInput.dataset.name;
                targetObj[paramName] = paramInput.value;
            }

            targets.push(targetObj);
        }

        const payload = {
            total_bandwidth: totalBandwidth,
            unit: unit,
            strategy: strategy,
            targets: targets
        };

        // Submit AJAX request
        fetch('<?= base_url('api/planner/calculate') ?>', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(res => res.json().then(data => ({ status: res.status, body: data })))
        .then(res => {
            if (res.status !== 200) {
                showError(res.body.messages?.error || res.body.message || 'Validation or computation failed.');
                return;
            }
            renderResults(res.body);
        })
        .catch(err => {
            showError('Server/network connection error.');
            console.error(err);
        });
    });

    function showError(msg) {
        errorMessage.textContent = msg;
        formErrorAlert.classList.remove('d-none');
        resultsPanel.classList.add('d-none');
        resultsPlaceholder.classList.remove('d-none');
    }

    function renderResults(data) {
        resultsPlaceholder.classList.add('d-none');
        resultsPanel.classList.remove('d-none');

        // Update Summary Metrics
        document.getElementById('summary-capacity').textContent = `Capacity: ${data.total_bandwidth} ${data.unit}`;
        document.getElementById('summary-strategy').textContent = `Strategy: ${strategySelect.options[strategySelect.selectedIndex].text}`;
        document.getElementById('summary-targets').textContent = `Targets: ${data.allocations.length}`;

        // Populate Table Rows
        resultsTbody.innerHTML = '';
        let totalAllocated = 0;
        const labels = [];
        const values = [];

        data.allocations.forEach(item => {
            totalAllocated += item.allocated;
            labels.push(item.name);
            values.push(item.allocated);

            const percentage = ((item.allocated / data.total_bandwidth) * 100).toFixed(1);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="fw-semibold text-dark">${item.name}</div>
                    <small class="text-muted">${item.details || ''}</small>
                </td>
                <td class="text-end fw-bold text-primary">${item.allocated} ${data.unit}</td>
                <td class="text-end">${percentage}%</td>
            `;
            resultsTbody.appendChild(tr);
        });

        document.getElementById('results-total-allocated').textContent = `${totalAllocated.toFixed(2)} ${data.unit}`;

        // Color Palette for Chart
        const palette = [
            '#607456', // Primary
            '#BA6A4C', // Accent
            '#7B2525', // Danger
            '#e1b12c', // Gold
            '#44bd32', // Green
            '#0097e6', // Blue
            '#8c7ae6', // Purple
            '#353b48'  // Dark Gray
        ];

        // Draw Pie Chart
        if (chartInstance) {
            chartInstance.destroy();
        }

        const ctx = document.getElementById('allocation-chart').getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: palette.slice(0, labels.length)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: {
                                family: 'Public Sans',
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }
});
</script>
<?= $this->endSection() ?>
