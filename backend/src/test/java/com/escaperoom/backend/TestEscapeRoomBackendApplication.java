package com.escaperoom.backend;

import org.springframework.boot.SpringApplication;

public class TestEscapeRoomBackendApplication {

	public static void main(String[] args) {
		SpringApplication.from(EscapeRoomBackendApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
