package com.paintball;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PaintballBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PaintballBackendApplication.class, args);
	}

}
