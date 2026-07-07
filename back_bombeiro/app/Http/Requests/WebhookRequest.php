<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WebhookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'sometimes|string',
            'action' => 'sometimes|string',
            'data.id' => 'sometimes|integer',
            'id' => 'sometimes|string',
            'topic' => 'sometimes|string',
            'resource' => 'sometimes|string',
        ];
    }
}
