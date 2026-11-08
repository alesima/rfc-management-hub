<?php

namespace App\Http\Controllers;

use App\Models\Rfc;
use Illuminate\Support\Str;

class RfcExportController extends Controller
{
    public function adr(Rfc $rfc)
    {
        $record = $rfc->decisionRecords()->with('decider')->orderByDesc('decided_at')->orderByDesc('id')->firstOrFail();

        return response($record->toMarkdown(), 200, [
            'Content-Type' => 'text/markdown; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.Str::slug($rfc->title).'-adr.md"',
        ]);
    }
}
