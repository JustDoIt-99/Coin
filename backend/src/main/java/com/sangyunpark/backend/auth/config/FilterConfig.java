package com.sangyunpark.backend.auth.config;

import com.sangyunpark.backend.auth.filter.JwtAuthFilter;
import com.sangyunpark.backend.auth.jwt.JwtTokenProvider;
import com.sangyunpark.backend.common.logging.RequestLoggingFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class FilterConfig {

    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public JwtAuthFilter jwtAuthFilter() {
        return new JwtAuthFilter(jwtTokenProvider);
    }

    @Bean
    public RequestLoggingFilter requestLoggingFilter() {
        return new RequestLoggingFilter();
    }

    @Bean
    public FilterRegistrationBean<RequestLoggingFilter> requestLoggingFilterRegistration() {
        FilterRegistrationBean<RequestLoggingFilter> bean =
                new FilterRegistrationBean<>();

        bean.setFilter(requestLoggingFilter());
        bean.addUrlPatterns("/api/*");
        bean.setOrder(0);

        return bean;
    }

    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtFilter() {
        FilterRegistrationBean<JwtAuthFilter> bean =
                new FilterRegistrationBean<>();

        bean.setFilter(jwtAuthFilter());
        bean.addUrlPatterns("/api/*");
        bean.setOrder(1);

        return bean;
    }
}
