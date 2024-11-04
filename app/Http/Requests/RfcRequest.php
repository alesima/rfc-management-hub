<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Config;

class RfcRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules(): array
    {
        $sections = Config::get('constants.sections');

        return array_reduce($sections, function ($rules, $section) {
            $rules[$section['name']] = 'nullable';
            return $rules;
        }, [
            'title'   => 'required|max:255',
            'summary' => 'required|max:255',
            'tags'    => 'array'
        ]);
    }
}
