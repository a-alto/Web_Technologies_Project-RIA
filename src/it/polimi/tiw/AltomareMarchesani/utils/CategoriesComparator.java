package it.polimi.tiw.AltomareMarchesani.utils;

import java.util.Comparator;

import it.polimi.tiw.AltomareMarchesani.beans.Category;

public class CategoriesComparator implements Comparator<Category> {

	@Override
	public int compare(Category o1, Category o2) {
		return o1.getCod().compareTo(o2.getCod());
	}

}
