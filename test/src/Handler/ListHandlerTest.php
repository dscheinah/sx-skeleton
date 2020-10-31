<?php

namespace AppTest\Handler;

use App\Handler\ListHandler;
use AppTest\Handler\Mock\Response;
use AppTest\Handler\Mock\ResponseHelper;
use PHPUnit\Framework\TestCase;
use Sx\Message\ServerRequest;

class ListHandlerTest extends TestCase
{
    public function testHandle(): void
    {
        $handler = new ListHandler(new ResponseHelper());
        /* @var Response $response */
        $response = $handler->handle((new ServerRequest())->withAttribute('input', 't-'));
        self::assertEquals(200, $response->getStatusCode());
        foreach ($response->data as $entry) {
            self::assertStringContainsString('t-', $entry);
        }
        $response = $handler->handle((new ServerRequest())->withAttribute('input', 'error'));
        self::assertEquals(400, $response->getStatusCode());
    }
}
