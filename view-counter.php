<?php
declare(strict_types=1);

/**
 * Tiny file-backed visitor counter.
 * Locks the file while incrementing so two visitors cannot lose a count.
 */

$file = __DIR__ . '/view-count.txt';
$count = 0;
$handle = @fopen($file, 'c+');

if ($handle !== false) {
    if (flock($handle, LOCK_EX)) {
        $raw = stream_get_contents($handle);
        $count = max(0, (int) trim((string) $raw));
        $count++;
        rewind($handle);
        ftruncate($handle, 0);
        fwrite($handle, (string) $count);
        fflush($handle);
        flock($handle, LOCK_UN);
    }
    fclose($handle);
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');

echo json_encode(['count' => $count], JSON_UNESCAPED_SLASHES);
