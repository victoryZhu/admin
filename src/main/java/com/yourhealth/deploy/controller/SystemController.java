package com.yourhealth.deploy.controller;

import java.util.Map;

import javax.inject.Inject;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.yourhealth.deploy.service.CategoryService;

/**
 * 系统模块功能控制类
 * @author zzm
 *
 */
@Controller
@RequestMapping("/deploy/system")
@Transactional(propagation = Propagation.REQUIRED)
public class SystemController {
	
	/*private String s_icon_modgroup="resources/image/jg.gif";
	private String s_icon_module="resources/image/jg.gif";
	private String s_icon_function="resources/image/jg.gif";*/
		
	@Inject
	private final CategoryService categoryService = null;
			
	/**
	 * 主框架
	 * @param model
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_USER')")
	@RequestMapping(method = RequestMethod.GET)
	public String main(Map<String, Object> model) {		
		model.put("nodes", categoryService.queryAllJsonCategorys());
		return "deploy/system/main";
	}	
	
}