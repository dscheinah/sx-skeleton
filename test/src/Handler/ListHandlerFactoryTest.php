<?php

namespace AppTest\Handler;

use App\Handler\ListHandler;
use App\Handler\ListHandlerFactory;
use AppTest\Handler\Mock\ResponseHelper;
use PHPUnit\Framework\TestCase;
use Sx\Container\Injector;
use Sx\Message\Response\ResponseHelperInterface;

class ListHandlerFactoryTest extends TestCase
{
    public function testCreate(): void
    {
        $injector = new Injector();
        $injector->set(ResponseHelperInterface::class, ResponseHelper::class);
        $factory = new ListHandlerFactory();
        $factory->create($injector, [], ListHandler::class);
        self::assertTrue(true);
    }
}
