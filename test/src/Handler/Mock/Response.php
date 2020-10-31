<?php

namespace AppTest\Handler\Mock;

class Response extends \Sx\Message\Response
{
    public $data;

    public function __construct($data = null)
    {
        $this->data = $data;
    }
}
