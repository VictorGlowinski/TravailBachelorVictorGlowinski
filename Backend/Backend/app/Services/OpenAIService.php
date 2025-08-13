<?php

namespace App\Services;

use OpenAI;

class OpenAIService
{
    protected $client;

    public function __construct()
    {
        $this->client = OpenAI::client(config('services.openai.key'));
    }

    public function generateText($prompt)
    {
        $result = $this->client->chat()->create([
            'model' => 'gpt-4o-mini', // ou autre modèle
            'messages' => [
                ['role' => 'system', 'content' => 'Tu es un assistant Laravel'],
                ['role' => 'user', 'content' => $prompt],
            ],
        ]);

        return $result->choices[0]->message->content;
    }
}
