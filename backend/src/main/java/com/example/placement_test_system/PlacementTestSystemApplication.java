package com.example.placement_test_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PlacementTestSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(PlacementTestSystemApplication.class, args);
	}

}
