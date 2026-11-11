<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ShiftTemplateRequest;
use App\Http\Resources\ShiftTemplateResource;
use App\Models\ShiftTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ShiftTemplateController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return ShiftTemplateResource::collection(
            ShiftTemplate::query()->orderBy('sort_order')->orderBy('id')->get()
        );
    }

    public function store(ShiftTemplateRequest $request): JsonResponse
    {
        $template = ShiftTemplate::create($request->validated() + [
            'sort_order' => (int) ShiftTemplate::max('sort_order') + 1,
        ]);

        return ShiftTemplateResource::make($template)->response()->setStatusCode(201);
    }

    public function update(ShiftTemplateRequest $request, ShiftTemplate $shiftTemplate): ShiftTemplateResource
    {
        $shiftTemplate->update($request->validated());

        return ShiftTemplateResource::make($shiftTemplate);
    }

    public function destroy(ShiftTemplate $shiftTemplate): Response
    {
        // Assigned shifts keep their times; the FK is nulled on delete.
        $shiftTemplate->delete();

        return response()->noContent();
    }
}
