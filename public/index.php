<?php

use App\Container\Provider;
use Sx\Config\ConfigProvider;
use Sx\Container\Injector;
use Sx\Message\ServerRequestFactory;
use Sx\Message\UriFactory;
use Sx\Server\ApplicationInterface;

$baseDirectory = dirname(__DIR__);
// Activate composer auto-loading.
require "$baseDirectory/vendor/autoload.php";

// Load configuration from the config dir. All files are merged in alphabetical order.
$configProvider = new ConfigProvider();
$configProvider->loadFiles("$baseDirectory/config/*.php");
$options = $configProvider->getConfig();

// Turn on error reporting if not in production environment according to configuration.
if (($options['env'] ?? '') === 'production') {
    error_reporting(0);
    ini_set('display_errors', 0);
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

// Create the injection dependency container and fill it with definitions provided by the application.
$injector = new Injector($options);
$injector->setup(new Provider());

// Create the server request to be handled by the application.
$uriFactory = new UriFactory();
$requestFactory = new ServerRequestFactory($uriFactory);
$request = $requestFactory->createServerRequest($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI'], $_SERVER);

/** @var Sx\Server\ApplicationInterface $app */
$app = $injector->get(ApplicationInterface::class);
// Finally run the application. The app and all middleware are loaded by the injector.
// The middleware chain and routing options are provided with the used factories of the App\Container\Provider.
$app->run($request);
