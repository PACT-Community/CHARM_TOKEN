// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./StandartToken.sol";


contract CHARMToken is StandartToken{
        constructor() StandartToken("CHARM", "CHARM", 1000000){
    } 
}