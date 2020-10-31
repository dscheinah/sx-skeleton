<?php

namespace AppTest\Handler\Mock;

use Psr\Http\Message\ResponseInterface;
use Sx\Message\Response\ResponseHelperInterface;

class ResponseHelper implements ResponseHelperInterface
{
    public function create(int $code, $response = null): ResponseInterface
    {
        return (new Response($response))->withStatus($code);
    }
}
