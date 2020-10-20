<?php

namespace App\Handler;

use Exception;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use RuntimeException;
use Sx\Message\Response\ResponseHelperInterface;

/**
 * A simple handler to be used as an example for the backend page.
 */
class ListHandler implements RequestHandlerInterface
{
    /**
     * The helper is used to create all responses.
     *
     * @var ResponseHelperInterface
     */
    private $helper;

    /**
     * Creates the handler.
     *
     * @param ResponseHelperInterface $helper
     */
    public function __construct(ResponseHelperInterface $helper)
    {
        $this->helper = $helper;
    }

    /**
     * Generates a list of random values prefixes by the POST attribute 'input'.
     * If the input matches 'error', a generic error with only a message is created.
     *
     * @param ServerRequestInterface $request
     *
     * @return ResponseInterface
     */
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $prefix = $request->getAttribute('input');
        if ($prefix === 'error') {
            return $this->helper->create(400, 'The prefix triggered an error.');
        }
        $list = [];
        try {
            for ($i = 0; $i < random_int(10, 50); $i++) {
                $list[] = $prefix . random_int(0, 500);
            }
        } catch (Exception $e) {
            // This exception should not happen in normal conditions is therefore mapped to a generic RuntimeException.
            throw new RuntimeException($e->getMessage(), $e->getCode(), $e);
        }
        return $this->helper->create(200, $list);
    }
}
