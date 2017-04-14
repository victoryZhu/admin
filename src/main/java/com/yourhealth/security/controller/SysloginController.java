package com.yourhealth.security.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.WebAttributes;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.yourhealth.orgnization.domain.Administrator;
import com.yourhealth.orgnization.service.AdministratorService;
import com.yourhealth.security.service.SysLogService;

/**
 * 系统登录控制类
 * @author zzm
 *
 */
@Controller
@Transactional(propagation = Propagation.REQUIRED)
public class SysloginController {

	@Autowired
	private AdministratorService administratorService;	
	@Autowired
	private SysLogService sysLogService;
	
	protected final Log logger = LogFactory.getLog(getClass());
		
	/**
	 * 返回登录页面
	 * @param httpSession
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 */
	@RequestMapping(value = {"/","/login"}, method = RequestMethod.GET)	
	public String login(HttpSession httpSession, HttpServletRequest request, HttpServletResponse response,		
			Map<String, Object> model) {
		return "login";
	}
	
	/**
	 * 
	 * @param request
	 * @param response
	 */
	@RequestMapping(value = "/login", method = RequestMethod.GET, headers = "X-Requested-With=XMLHttpRequest")
	public void loginViaAjax(HttpServletRequest request, HttpServletResponse response) {
		String url = request.getRequestURI() + (request.getQueryString() == null ? "" : ("?"+request.getQueryString()));
		PrintWriter out;
		try {
			out = response.getWriter();
			out.println("<script>");
			out.println("document.location.href='" + url + "'");
			out.println("</script>");
			out.flush();
		} catch (IOException e) {			
			e.printStackTrace();
		}
	}
		
	/**
	 * 到主界面  
	 * 当用户有多个身份或多个公司权限时，选择登录公司和系统后进入系统主界面
	 * @param httpSession
	 * @param request
	 * @param model
	 * @param attr
	 * @return
	 */
	@RequestMapping(value = {"/main" }, method = {RequestMethod.POST, RequestMethod.GET})
	public String main(HttpSession httpSession, HttpServletRequest request,					
			Map<String, Object> model, RedirectAttributes attr) {		
				
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		Administrator administrator = administratorService.findOneByUsername(username);
		  
		try {			
			httpSession.setMaxInactiveInterval((int) (0.5 * 3600));
			httpSession.setAttribute("administrator", administrator);
			return "main";			
		} catch (AuthenticationException e) {
			e.printStackTrace();
			// 如果forward到login页面，保存异常信息在request中
			// request.setAttribute(WebAttributes.AUTHENTICATION_EXCEPTION, e);
			request.getSession().setAttribute(WebAttributes.AUTHENTICATION_EXCEPTION, e);
			attr.addAttribute("error", "");
			return "redirect:/login";
		}		
	}		

	/**
	 * 系统主界面的top
	 * @param httpSession
	 * @param model
	 * @return
	 */
	@RequestMapping("/top")
	public String showTop(HttpSession httpSession,Map<String, Object> model){
		Administrator administrator = (Administrator) httpSession.getAttribute("administrator");
		model.put("name",administrator.getName());
		return "top";
	}
	
	/**
	 * 系统主界面的menu
	 * @return
	 */
	@RequestMapping("/menu")
	public String showMenu(){
		return "menu";
	}
	
	/**
	  * 修改管理员密码
	  * @param oldyhkl
	  * @param yhkl
	  * @return
	  */
	@RequestMapping(value = "/administrator/updpassword", method = RequestMethod.PUT)
	@ResponseBody
	public Map<String, Object> chgMyPasswd(
			@RequestParam(value = "oldyhkl", required = false) String oldyhkl,
			@RequestParam(value = "yhkl", required = false) String yhkl) {		
		
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		Administrator administrator = administratorService.findOneByUsername(username);
	
		Map<String, Object> model = new HashMap<String, Object>();
		model.put("key_id", administrator.getId());	
		
		//检查旧密码是否正确		
		if(!administratorService.checkPassword(administrator.getId(), oldyhkl)){			
			model.put("success", false);
			model.put("message", "输入密码错误，请重新输入！");			
			return model;			
		}			
				
		administratorService.updPassword(administrator.getId(), yhkl);
					
		model.put("success", true);
		model.put("message", "ok");
		return model;			
	}
	
}