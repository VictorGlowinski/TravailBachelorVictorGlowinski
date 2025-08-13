<?php

class OpenAIController extends Controller
{
    public function index(OpenAIService $openAI)
    {
        $texte = $openAI->generateText("Explique-moi Laravel en 3 phrases");
        return response()->json(['resultat' => $texte]);
    }
}
