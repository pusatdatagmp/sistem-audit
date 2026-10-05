<?php

namespace App\Http\Controllers\Concerns;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;

trait SortsQuery
{
    /**
     * Apply column sorting requested via `sort`/`direction` query params, constrained to a
     * whitelist of allowed keys. Falls back to $applyDefault when no valid sort is requested,
     * so each table keeps its existing default ordering until a user clicks a header.
     *
     * @param  Builder|Relation  $query  an Eloquent builder, or a relation query (e.g. $model->related())
     * @param  array<string, string|Closure>  $sortable  whitelisted sort key => column name, or
     *                                                   a closure returning a subquery builder
     *                                                   for sorting by a related column
     * @return array{sort: string|null, direction: string|null}
     */
    protected function applySort(Builder|Relation $query, Request $request, array $sortable, Closure $applyDefault): array
    {
        $key = $request->string('sort')->toString();

        if ($key === '' || ! array_key_exists($key, $sortable)) {
            $applyDefault($query);

            return ['sort' => null, 'direction' => null];
        }

        $direction = $request->string('direction')->toString() === 'desc' ? 'desc' : 'asc';
        $column = $sortable[$key];

        $query->orderBy($column instanceof Closure ? $column() : $column, $direction);

        return ['sort' => $key, 'direction' => $direction];
    }
}
