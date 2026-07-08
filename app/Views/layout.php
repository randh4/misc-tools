<!DOCTYPE html>
<html lang="en" class="light-style layout-menu-fixed" dir="ltr" data-theme="theme-default">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0" />
    <title><?= $title ?? 'Network Tools Platform' ?></title>
    <meta name="description" content="Utility platform for Network Engineers, IT Support, and System Administrators." />

    <!-- Fonts & Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet" />
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />

    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />

    <!-- Custom Premium Styling -->
    <style>
        :root {
            --bs-primary: #607456;
            --bs-primary-rgb: 96, 116, 86;
            --primary-color: #607456;
            --bg-color: #f7f5f0; /* Soft tint of beige for background readability */
            --beige-dark: #EEE0CC;
            --accent-color: #BA6A4C;
            --danger-color: #7B2525;
            --card-shadow: 0 2px 6px 0 rgba(67, 89, 113, 0.12);
        }

        body {
            font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--bg-color);
            color: #566a7f;
            overflow-x: hidden;
        }

        .btn-primary {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
        }
        .btn-primary:hover, .btn-primary:focus, .btn-primary:active {
            background-color: #4f6047 !important;
            border-color: #4f6047 !important;
        }

        .btn-outline-primary {
            color: var(--primary-color);
            border-color: var(--primary-color);
        }
        .btn-outline-primary:hover {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
        }

        .text-primary {
            color: var(--primary-color) !important;
        }

        /* Sidebar Styling */
        #layout-menu {
            width: 260px;
            background-color: #ffffff;
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1000;
            border-right: 1px solid #e4e6e8;
            box-shadow: var(--card-shadow);
            transition: all 0.3s;
        }

        .menu-inner {
            display: flex;
            flex-direction: column;
            padding: 1rem 0;
        }

        .app-brand {
            padding: 1.5rem;
            display: flex;
            align-items: center;
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--primary-color);
            text-decoration: none;
            border-bottom: 1px solid #f0f2f4;
        }

        .menu-item {
            padding: 0.25rem 1rem;
        }

        .menu-link {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 0.625rem 1rem;
            color: #697a8d;
            border-radius: 0.375rem;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s;
        }

        .menu-link:hover {
            background-color: #f5f6f8;
            color: #566a7f;
        }

        .menu-item.active .menu-link {
            background-color: rgba(96, 116, 86, 0.15);
            color: var(--primary-color);
        }

        /* Main Content area */
        .layout-page {
            margin-left: 260px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            transition: all 0.3s;
        }

        .navbar-main {
            background-color: #ffffff;
            border-bottom: 1px solid #e4e6e8;
            padding: 0.8rem 1.5rem;
            box-shadow: var(--card-shadow);
        }

        .content-wrapper {
            flex-grow: 1;
            padding: 1.5rem;
        }

        .card {
            border: none;
            border-radius: 0.5rem;
            box-shadow: var(--card-shadow);
            margin-bottom: 1.5rem;
            background-color: #ffffff;
        }

        .card-header {
            background-color: transparent;
            border-bottom: 1px solid #f0f2f4;
            padding: 1.25rem;
        }

        footer {
            background-color: #ffffff;
            border-top: 1px solid #e4e6e8;
            padding: 1rem 1.5rem;
            margin-top: auto;
        }

        /* Responsive */
        @media (max-width: 991.98px) {
            #layout-menu {
                left: -260px;
            }
            #layout-menu.show {
                left: 0;
            }
            .layout-page {
                margin-left: 0;
            }
        }
    </style>
</head>
<body>
    <div class="layout-wrapper layout-content-navbar">
        <div class="layout-container">
            <!-- Sidebar -->
            <aside id="layout-menu" class="layout-menu menu-vertical menu bg-menu-theme">
                <a href="<?= base_url() ?>" class="app-brand demo">
                    <span class="app-brand-logo demo me-2 text-primary">
                        <i class="bx bx-network-chart fs-3"></i>
                    </span>
                    <span class="app-brand-text demo menu-text fw-bolder">NetTools</span>
                </a>
                <ul class="menu-inner py-1">
                    <li class="menu-item <?= current_url() == base_url() || current_url() == base_url('/') ? 'active' : '' ?>">
                        <a href="<?= base_url() ?>" class="menu-link">
                            <i class="menu-icon tf-icons bx bx-home-circle"></i>
                            <div>Dashboard</div>
                        </a>
                    </li>
                    <li class="menu-header small text-uppercase"><span class="menu-header-text">Network Tools</span></li>
                    <li class="menu-item <?= str_contains(current_url(), 'planner') ? 'active' : '' ?>">
                        <a href="<?= base_url('planner') ?>" class="menu-link">
                            <i class="menu-icon tf-icons bx bx-calculator"></i>
                            <div>Bandwidth Planner</div>
                        </a>
                    </li>
                </ul>
            </aside>

            <!-- Layout Page -->
            <div class="layout-page">
                <!-- Navbar -->
                <nav class="navbar navbar-main navbar-expand-xl align-items-center justify-content-between" id="layout-navbar">
                    <div class="d-flex align-items-center">
                        <button class="btn btn-link text-dark d-lg-none me-3" type="button" onclick="document.getElementById('layout-menu').classList.toggle('show')">
                            <i class="bx bx-menu fs-3"></i>
                        </button>
                        <span class="fw-bold fs-5 text-dark">Network Tools Platform</span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span class="badge bg-label-primary px-3 py-2 text-primary" style="background-color: rgba(96, 116, 86, 0.15)">MVP v1.0</span>
                    </div>
                </nav>

                <!-- Content Wrapper -->
                <div class="content-wrapper">
                    <div class="container-xxl flex-grow-1 container-p-y">
                        <?= $this->renderSection('content') ?>
                    </div>
                </div>

                <!-- Footer -->
                <footer class="footer bg-footer-theme">
                    <div class="container-xxl d-flex flex-wrap justify-content-between py-2 flex-md-row flex-column">
                        <div class="mb-2 mb-md-0">
                            © <?= date('Y') ?> <strong>NetTools Platform</strong>. All Rights Reserved.
                        </div>
                        <div>
                            Version 1.0.0
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    </div>

    <!-- Bootstrap 5 JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <?= $this->renderSection('scripts') ?>
</body>
</html>
