<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Dashboard::index');
$routes->get('/planner', 'BandwidthPlanner::index');
$routes->get('/api/planner/strategies', 'BandwidthPlanner::strategies');
$routes->post('/api/planner/calculate', 'BandwidthPlanner::calculate');
