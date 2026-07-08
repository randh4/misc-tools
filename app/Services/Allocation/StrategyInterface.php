<?php

namespace App\Services\Allocation;

interface StrategyInterface
{
    /**
     * Calculate bandwidth allocation.
     *
     * @param float $totalBandwidth
     * @param array $targets
     * @return array
     */
    public function calculate(float $totalBandwidth, array $targets): array;

    /**
     * Validate input data.
     *
     * @param float $totalBandwidth
     * @param array $targets
     * @return string|null
     */
    public function validate(float $totalBandwidth, array $targets): ?string;

    /**
     * Get form fields for dynamic form rendering.
     *
     * @return array
     */
    public function getFields(): array;

    /**
     * Get strategy description.
     *
     * @return string
     */
    public function getDescription(): string;

    /**
     * Get strategy instructions.
     *
     * @return array
     */
    public function getInstruction(): array;
}
